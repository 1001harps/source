import { Box, Button, Input } from "@chakra-ui/react";
import { useState } from "react";

export const Home = () => {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const body = new FormData();
    body.append("email", emailInput);
    body.append("password", passwordInput);

    console.log(body);

    setEmailInput("");
    setPasswordInput("");
  };

  return (
    <Box>
      <form onSubmit={onSubmit}>
        <label>
          email
          <Input
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            type="text"
            name="email"
          />
        </label>

        <label>
          password
          <Input
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            type="password"
            name="email"
          />
        </label>

        <Button type="submit">submit</Button>
      </form>
    </Box>
  );
};
