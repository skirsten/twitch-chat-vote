import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Code,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  ListItem,
  Spacer,
  Stack,
  UnorderedList,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEventHandler, useEffect } from "react";
import { GitHubIcon } from "../icons";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/[channel]");
  }, []);

  const onFormSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const target = event.target as typeof event.target & {
      elements: Record<
        "channel" | "window" | "cooldown" | "filter",
        { value: string }
      >;
      reset: () => void;
    };

    const channel = target.elements.channel.value;
    const window = parseFloat(target.elements.window.value);
    const cooldown = parseFloat(target.elements.cooldown.value);
    const filter = [
      ...new Set(
        target.elements.filter.value.toLowerCase().match(/\b(\w+)\b/g)
      ),
    ].join(",");

    router.push({
      pathname: "/[channel]",
      query: {
        channel,
        ...(window !== 3 && { window }),
        ...(cooldown && { cooldown }),
        ...(filter && { filter }),
      },
    });
  };

  return (
    <Container maxW="container.md">
      <Head>
        <title>Twitch Chat Vote</title>
        <meta name="description" content="Let the chat decide." />
      </Head>
      <Stack py={6} spacing={6}>
        <HStack>
          <Heading>Twitch Chat Vote</Heading>
          <Spacer />
          <Link href="https://github.com/skirsten/twitch-chat-vote" passHref>
            <IconButton as="a" aria-label="GitHub" icon={<GitHubIcon />} />
          </Link>
        </HStack>

        <Box pl={2}>
          <UnorderedList spacing={3}>
            <ListItem>
              Each word per message is only counted once, spamming is useless.
            </ListItem>
          </UnorderedList>
        </Box>

        <form onSubmit={onFormSubmit}>
          <Stack py={6} spacing={6}>
            <FormControl isRequired>
              <FormLabel htmlFor="channel">Twitch channel</FormLabel>
              <Input id="channel" type="text" placeholder="e.g. kitboga" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor="window">Window size in seconds</FormLabel>
              <Input
                id="window"
                type="number"
                defaultValue={3}
                min={0}
                step={0.1}
              />
              <FormHelperText>
                How long each individual message is counted. Decimals are also
                supported.
              </FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor="cooldown">User cooldown in seconds</FormLabel>
              <Input
                id="cooldown"
                type="number"
                defaultValue={0}
                min={0}
                step={0.1}
              />
              <FormHelperText>
                How long to cool down per user. During this period the user{"'"}
                s messages are ignored. <Code>0</Code> is effectively off. Input
                a huge number like <Code>9999999999</Code> to allow only one
                vote per user.
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="filter">Filter words</FormLabel>
              <Input
                id="filter"
                type="text"
                placeholder="e.g. yes no why what"
              />
            </FormControl>

            <HStack>
              <Spacer />
              <Button rightIcon={<ArrowForwardIcon />} type="submit">
                Go
              </Button>
            </HStack>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
