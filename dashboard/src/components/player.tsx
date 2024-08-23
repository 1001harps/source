import { Box } from "@chakra-ui/react";
import { createContext, useContext, useMemo, useRef } from "react";

interface PlayerContextValue {
  ref: React.RefObject<HTMLAudioElement>;
  load: (url: string) => void;
  play: (url: string) => void;
  clear: () => void;
}

export const PlayerContext = createContext<PlayerContextValue>({
  // @ts-ignore
  ref: null,
  load: () => {},
  play: () => {},
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLAudioElement>(null);

  const value = useMemo(() => {
    const play = (url: string) => {
      if (!ref.current) {
        return;
      }

      ref.current.src = url;
      ref.current.play();
    };

    const load = (url: string) => {
      if (!ref.current) {
        return;
      }

      ref.current.src = url;
    };

    const clear = () => {
      if (!ref.current) {
        return;
      }

      ref.current.pause();
      ref.current.currentTime = 0;
      ref.current.src = "";
    };

    return {
      ref,
      play,
      load,
      clear,
    };
  }, []);

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

export const Player = () => {
  const { ref } = useContext(PlayerContext);

  return (
    <Box
      p="8px"
      h="70px"
      position="fixed"
      bottom={0}
      left={0}
      w="100%"
      bg="grey"
    >
      <Box as="audio" w="100%" ref={ref} controls></Box>
    </Box>
  );
};
