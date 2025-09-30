import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        firstname: "",
        middlename: "",
        lastname: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            {/* Logo + Title */}
            <div className="flex flex-col items-center gap-3 mb-8">
                <img src="logo/psu.png" alt="PSU Logo" className="h-14 w-14" />
                <h1 className="text-2xl font-semibold">Create your account</h1>
            </div>

            {/* Card */}
            <div className="w-[550px] flex flex-col rounded-2xl shadow-xl bg-white border border-gray-200 overflow-hidden">
                <Head title="Register" />

                {/* Gradient strip on top */}
                <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-400"></div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-10 justify-between">
                    {/* Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Grid: 3 rows × 2 columns */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* First Name */}
                            <div>
                                <InputLabel
                                    htmlFor="firstname"
                                    value="First Name"
                                />
                                <TextInput
                                    id="firstname"
                                    name="firstname"
                                    value={data.firstname}
                                    className="mt-1 block w-full rounded-lg"
                                    autoComplete="given-name"
                                    onChange={(e) =>
                                        setData("firstname", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.firstname}
                                    className="mt-2"
                                />
                            </div>

                            {/* Middle Name */}
                            <div>
                                <InputLabel
                                    htmlFor="middlename"
                                    value="Middle Name"
                                />
                                <TextInput
                                    id="middlename"
                                    name="middlename"
                                    value={data.middlename}
                                    className="mt-1 block w-full rounded-lg"
                                    autoComplete="additional-name"
                                    onChange={(e) =>
                                        setData("middlename", e.target.value)
                                    }
                                    placeholder="Optional"
                                />
                                <InputError
                                    message={errors.middlename}
                                    className="mt-2"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <InputLabel
                                    htmlFor="lastname"
                                    value="Last Name"
                                />
                                <TextInput
                                    id="lastname"
                                    name="lastname"
                                    value={data.lastname}
                                    className="mt-1 block w-full rounded-lg"
                                    autoComplete="family-name"
                                    onChange={(e) =>
                                        setData("lastname", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.lastname}
                                    className="mt-2"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full rounded-lg"
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full rounded-lg"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full rounded-lg"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <Link
                                href={route("login")}
                                className="text-sm text-gray-600 underline hover:text-gray-900"
                            >
                                Already registered?
                            </Link>
                            <PrimaryButton disabled={processing}>
                                Register
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-grow h-px bg-gray-300"></div>
                        <span className="px-3 text-gray-500 text-sm">OR</span>
                        <div className="flex-grow h-px bg-gray-300"></div>
                    </div>

                    {/* Google Register */}
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
