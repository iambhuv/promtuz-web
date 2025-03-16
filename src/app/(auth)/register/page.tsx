"use client";

import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleRequest } from "@/lib/api";
import { jsonBytes } from "@/lib/utils";
// import { z } from "zod";

// const formSchema = z.object({
//   display_name: z.string(),
//   username: z.string().min(3, {
//     message: "Username must be at least 3 characters.",
//   }),
//   password: z.string().min(8),
//   confirm_password: z.string().min(8),
// }).superRefine((data) => {
//   if (data.password !== data.confirm_password) {
//     return { confirm_password: "Passwords do not match" };
//   }
//   return true;
// });

const RegisterPage = () => {
  const router = useRouter();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    const formData = new FormData(ev.currentTarget);
    ev.preventDefault();
    const { display_name, username, password, confirm_password } = Object.fromEntries(formData.entries());
    if (confirm_password !== password || !username || !password || !confirm_password || !display_name) return;

    try {
      // const res = await fetch(`${process.env.API_ENDPOINT}/register`, {
      //   method: "POST",
      //   body: JSON.stringify({ username, password, display_name }),
      //   headers: {
      //     "content-type": "application/json"
      //   }
      // });

      const { data, err } = await handleRequest<{ id: string }>("POST", `/register`, jsonBytes({
        username, password, display_name
      }));


      if (!err && data && data.id) router.push('/login');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <form onSubmit={onSubmit} className="mx-auto max-w-[26rem] w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>
              Create new account by filling the form below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Field name="display_name" label="Display Name" type="text" required />
              <Field name="username" label="Username" type="text" required min={3} />
              <Field name="password" label="Password" type="password" autoComplete="new-password" required />
              <Field name="confirm_password" label="Confirm Password" type="password" autoComplete="new-password" required />

              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

const Field = ({ name, label, type, autoComplete = "", placeholder = "", ...props }: {
  name: string,
  label: string,
  type: string,
  autoComplete?: string,
  placeholder?: string
} & InputProps) => {
  return <div className="grid gap-2">
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} {...props} />
  </div>
}

export default RegisterPage;
