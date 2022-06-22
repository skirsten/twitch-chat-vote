import {
  Box,
  Center,
  Spinner,
  Stack,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import tmi from "tmi.js";
import Entry from "../entry";

export default function Channel() {
  const router = useRouter();
  const channel = router.query.channel as string;
  const transparent = !!router.query.transparent;
  const window = parseFloat((router.query.window as string) || "1");

  const [isLoaded, setLoaded] = useBoolean();
  const [topTokens, setTopTokens] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const client = new tmi.Client({
      channels: [channel],
    });

    const connectPromise = client.connect();

    client.on("join", () => {
      setLoaded.on();
    });

    client.on("message", (channel, tags, message, self) => {
      const matches = message.toLowerCase().match(/\b(\w+)\b/g);
      if (!matches) {
        return;
      }

      const tokens = new Set(matches);

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
  }, [channel]);

  useEffect(() => {
    const callback = () => {
      const now = Date.now();

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
  }, [window]);

  let sortedTopTokens = Object.entries(topTokens);

  sortedTopTokens = sortedTopTokens.sort((a, b) => b[1].length - a[1].length);
  sortedTopTokens = sortedTopTokens.slice(0, 50);

  return (
    <Box h="100vh" overflow="hidden">
      <Head>
        <title>
          {channel ? `${channel} | Twitch Chat Vote` : "Twitch Chat Vote"}
        </title>
      </Head>

      {transparent && (
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
