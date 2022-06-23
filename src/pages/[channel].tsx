import {
  Box,
  Center,
  Spinner,
  Stack,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { LayoutGroup } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import tmi from "tmi.js";
import Entry from "../entry";

export default function Channel() {
  const router = useRouter();

  const params = {
    channel: router.query.channel as string,
    transparent: !!router.query.transparent,
    filter: router.query.filter as string | undefined,
    window: (router.query.window as string | undefined) || "3",
    cooldown: (router.query.cooldown as string | undefined) || "0",
  };

  const [isLoaded, setLoaded] = useBoolean();
  const [topTokens, setTopTokens] = useState<Record<string, number[]>>({});
  const userCooldown = useRef<Record<string, number>>({});

  useEffect(() => {
    const client = new tmi.Client({
      channels: [params.channel],
    });
    const cooldown = parseFloat(params.cooldown);
    const filter = params.filter
      ? new Set(params.filter.split(","))
      : undefined;

    const connectPromise = client.connect();

    client.on("join", () => {
      setLoaded.on();
    });

    client.on("message", (channel, tags, message, self) => {
      if (cooldown) {
        const now = Date.now();
        const userId = tags["user-id"];
        if (!userId) return;

        if (
          userCooldown.current[userId] &&
          userCooldown.current[userId] + cooldown * 1000 > now
        ) {
          return;
        }

        userCooldown.current[userId] = now;
      }

      const matches = message.toLowerCase().match(/\b(\w+)\b/g);
      if (!matches) {
        return;
      }

      const tokens = new Set(
        filter ? matches.filter((match) => filter.has(match)) : matches
      );

      if (tokens.size) {
        setTopTokens((topTokens) => {
          const newTopTokens = Object.assign({}, topTokens);

          const now = Date.now();
          for (const token of tokens) {
            newTopTokens[token] = [...(newTopTokens[token] || []), now];
          }

          return newTopTokens;
        });
      }
    });

    return () => {
      connectPromise.then(() => client.disconnect());
    };
  }, [params.channel, params.filter, params.cooldown, setLoaded]);

  useEffect(() => {
    const cooldown = parseFloat(params.cooldown);
    const window = parseFloat(params.window);

    const callback = () => {
      const now = Date.now();

      userCooldown.current = Object.fromEntries(
        Object.entries(userCooldown.current).filter(
          ([user, ts]) => ts + cooldown * 1000 <= now
        )
      );

      setTopTokens((topTokens) =>
        Object.fromEntries(
          Object.entries(topTokens)
            .map(([token, hypeTS]) => [
              token,
              hypeTS.filter((ts) => ts + window * 1000 > now),
            ])
            .filter(([token, hypeTS]) => hypeTS.length > 0)
        )
      );
    };

    const ticker = setInterval(callback, 100);

    return () => clearTimeout(ticker);
  }, [params.cooldown, params.window]);

  let sortedTopTokens = Object.entries(topTokens);

  sortedTopTokens = sortedTopTokens.sort((a, b) => b[1].length - a[1].length);
  sortedTopTokens = sortedTopTokens.slice(0, 50);

  return (
    <Box h="100vh" overflow="hidden">
      <Head>
        <title key="title">Twitch Chat Vote</title>
        <meta
          key="description"
          name="description"
          content="Let the chat decide."
        />
      </Head>

      <Head>
        {params.channel && (
          <>
            <title key="title">{params.channel} - Twitch Chat Vote</title>
            <meta
              key="description"
              name="description"
              content={`Let ${params.channel}'s chat decide.`}
            />
          </>
        )}
      </Head>

      {params.transparent && (
        <style jsx global>{`
          body {
            background-color: transparent;
          }
        `}</style>
      )}

      <LayoutGroup>
        {!isLoaded && (
          <Center minH="100vh">
            <Spinner />
          </Center>
        )}
        <Stack textAlign="center" py={16} spacing={16}>
          {sortedTopTokens.map(([token, hype], index) => (
            <Entry key={token} hype={hype.length} index={index}>
              <Box>
                <Text
                  fontWeight="bold"
                  textShadow="0.5px 0.5px black"
                  textTransform="uppercase"
                >
                  {token}
                </Text>
              </Box>
            </Entry>
          ))}
        </Stack>
      </LayoutGroup>
    </Box>
  );
}
