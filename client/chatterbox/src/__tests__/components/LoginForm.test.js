import { createStore } from "redux";
import { Provider } from "react-redux";
import { waitFor, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginForm from "../../components/LoginForm";
import store from "../../redux/store";
import { api } from "../../axios";

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
