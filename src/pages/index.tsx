import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
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
      elements: { channel: { value: string }; window: { value: string } };
      reset: () => void;
    };

    const channel = target.elements.channel.value;
    const window = target.elements.window.value;

    router.push({
      pathname: "/[channel]",
      query: { channel, window },
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
              <Input id="channel" type="text" />
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
