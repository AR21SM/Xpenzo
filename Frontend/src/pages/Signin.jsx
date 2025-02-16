import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card } from "primereact/card";
import { Message } from "primereact/message";

import { Heading } from "../components/Heading";
import { SubHeading } from "../components/SubHeading";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { BottomWarning } from "../components/BottomWarning";

const loginValidationSchema = yup.object().shape({
  email: yup.string().required("Email is required").email("Enter a valid email"),
  password: yup.string().required("Password is required").min(6, "At least 6 characters"),
});

export function Signin() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(loginValidationSchema) });

  const submitLogin = async (data) => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signin", data);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <Heading label="Sign In" />
        <SubHeading label="Enter your credentials to access your account" />

        {errorMessage && <Message severity="error" text={errorMessage} className="mb-4" />}

        <form onSubmit={handleSubmit(submitLogin)} className="space-y-4">
          <InputBox label="Email" type="email" placeholder="yourname@example.com" {...register("email")} />
          <p className="text-sm text-red-500">{errors.email?.message}</p>

          <InputBox label="Password" type="password" placeholder="••••••••" {...register("password")} />
          <p className="text-sm text-red-500">{errors.password?.message}</p>

          <Button type="submit" label="Sign In" disabled={submitting} />
        </form>

        <BottomWarning label="Don't have an account?" buttonText="Sign up" to="/signup" className="mt-4" />
      </Card>
    </div>
  );
}
