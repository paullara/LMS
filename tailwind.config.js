import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Poppins", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                navy: "#000080",
                gold: "#FFCF40",
                bluepsu: "#3F00FF",
            },
            height: {
                form: "680px",
                class: "800px",
                container: "380px",
                subcode: "64px",
                card: "120px",
                createclass: "52px",
            },
            width: {
                container: "300px",
                subject: "270px",
                image: "500px",
            },
        },
    },

    plugins: [forms],
};
