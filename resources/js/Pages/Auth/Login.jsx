import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Card */}
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 justify-center mb-8">
                <img src="logo/psu.png" alt="PSU Logo" className="h-14 w-14" />
                {/* <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
                    <span className="text-blue-600">PSU</span>
                    <span className="text-yellow-500">Learn</span>
                </h1> */}
                <h1 className="text-2xl font-semibold">
                    Sign in to your account
                </h1>
            </div>
            <div className="w-[420px] rounded-2xl shadow-lg bg-white border border-gray-100 relative overflow-hidden">
                <Head title="Log in" />

                {/* Header accent */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-yellow-400"></div>

                {/* Content */}
                <div className="p-10">
                    {/* Status message */}
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 text-center">
                            {status}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600">
                                Remember me
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="text-sm text-blue-600 hover:text-blue-800 transition"
                                >
                                    Forgot your password?
                                </Link>
                            )}
                            <PrimaryButton
                                className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white px-6 py-2 rounded-lg shadow transition"
                                disabled={processing}
                            >
                                Log in
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Register */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don’t have an account?{" "}
                        <Link
                            href={route("register")}
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            Register here
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-grow h-px bg-gray-200"></div>
                        <span className="px-3 text-gray-400 text-sm">OR</span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>

                    {/* Google Login */}
                    <div className="text-center">
                        <a
                            href={route("redirect.google")}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 transition"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google"
                                className="mr-2 h-5 w-5"
                            />
                            Continue with Google
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
