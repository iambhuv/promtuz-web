"use client";

import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { handleRequest } from "@/lib/api";
import { jsonBytes } from "@/lib/utils";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    const formData = new FormData(ev.currentTarget);
    ev.preventDefault();

    try {
      const { username, password } = Object.fromEntries(formData.entries());

      const { data, err } = await handleRequest<{ token: string }>("POST", `/login?cookie=true`, jsonBytes({
        username, password
      }));

      console.log(data, err);


      // const res = await fetch(`${process.env.API_ENDPOINT}/login?cookie=true`, {
      //   method: "POST",
      //   body: JSON.stringify({ username, password }),
      //   credentials: 'include',
      //   headers: {
      //     "content-type": "application/json"
      //   }
      // });
      if (data && data.token !== null) {
        localStorage.setItem("token", data.token);

        const redirectPath = searchParams.get('redirect_path');
        router.push((redirectPath ? decodeURIComponent(redirectPath) : '/app'))
      }
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <form onSubmit={onSubmit} className="mx-auto max-w-[24rem] w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your username below to login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Field name="username" label="Username" type="text" required min={3} />
              <Field name="password" label="Password" type="password" required />

              <Button type="submit" className="w-full">Login</Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div >
  );
};


const Field = ({ name, label, type, ...props }: {
  label: string,
} & InputProps) => {
  return <div className="grid gap-2">
    <Label htmlFor={name}>{label}</Label>
    <Input name={name} {...props} />
  </div>
}


export default LoginPage;
