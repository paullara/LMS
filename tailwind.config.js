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
                dashboard: "765px",
                profile: "800px",
                greetings: "300px",
                picture: "100px",
                top: "85px",
                welcomehero: "700px",
                anauthorized: "300px",
                profile: "750px",
                left: "600px",
                profile_info: "210px",
                phone: "17px",
                email: "17px",
                house: "18px",
                building: "18px",
                pin: "18px",
                book: "18px",
            },
            width: {
                container: "300px",
                subject: "270px",
                image: "500px",
                left: "850px",
                right: "390px",
                table: "10px",
                sidebar: "209px",
                header: "500px",
                profile: "700px",
            },
            fontSize: {
                xs: "12px",
                sm: "14px",
                base: "16px",
                large: "60px",
                xl: "20px",
                "2xl": "24px",
                "3xl": "30px",
                "4xl": "36px",
                "5xl": "48px",
                title: "56px",
            },
        },
    },

    plugins: [forms],
};
