import { createStore } from "redux";
import { Provider } from "react-redux";
import { waitFor, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginForm from "../../components/LoginForm";
import store from "../../redux/store";
import { api } from "../../axios";

describe("username field validation", () => {
  test.each`
    testCase       | username             | errorMessage
    ${"missing"}   | ${""}                | ${"Username is required."}
    ${"too short"} | ${"usr"}             | ${"Username has to have at least 8 characters."}
    ${"too long"}  | ${"usr".repeat(200)} | ${"Username has to have at most 128 characters."}
  `(
    "validation fails if username $testCase",
    async ({ testCase, username, errorMessage }) => {
      render(
        <Provider store={store}>
          <LoginForm />
        </Provider>
      );

      const usernameField = screen.getByLabelText("username");
      userEvent.click(usernameField);
      userEvent.type(usernameField, username);
      const loginButton = screen.getByRole("button", { name: /login/i });
      userEvent.click(loginButton);

      await waitFor(() => {
        const usernameValidationMessage = screen.getByText(errorMessage);
        expect(usernameValidationMessage).toBeTruthy();
      });
    }
  );
});

describe("password field validation", () => {
  test.each`
    testCase       | password              | errorMessage
    ${"missing"}   | ${""}                 | ${"Password is required."}
    ${"too short"} | ${"pass"}             | ${"Password has to have at least 8 characters."}
    ${"too long"}  | ${"pass".repeat(200)} | ${"Password has to have at most 128 characters."}
  `(
    "validation fails if password $testCase",
    async ({ testCase, password, errorMessage }) => {
      render(
        <Provider store={store}>
          <LoginForm />
        </Provider>
      );

      const passwordField = screen.getByLabelText("password");
      userEvent.click(passwordField);
      userEvent.type(passwordField, password);
      const loginButton = screen.getByRole("button", { name: /login/i });
      userEvent.click(loginButton);

      await waitFor(() => {
        const passwordValidationMessage = screen.getByText(errorMessage);
        expect(passwordValidationMessage).toBeTruthy();
      });
    }
  );
});

test("fires request on correct user credentials", async () => {
  const spyPost = jest.spyOn(api, "post").mockResolvedValue({
    data: {
      user: "",
      accessToken: "",
      refreshToken: "",
    },
  });

  render(
    <Provider store={store}>
      <LoginForm />
    </Provider>
  );

  const usernameField = screen.getByLabelText("username");
  const passwordField = screen.getByLabelText("password");
  const loginButton = screen.getByRole("button", { name: /login/i });

  userEvent.click(usernameField);
  userEvent.type(usernameField, "test_username");
  userEvent.click(passwordField);
  userEvent.type(passwordField, "test_password");
  userEvent.click(loginButton);

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith("/auth/tokens", {
      username: "test_username",
      password: "test_password",
    });
  });
});
