import InstructorLayout from "@/Layouts/InstructorLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaUserGraduate, FaChalkboardTeacher, FaTasks } from "react-icons/fa";

export default function Dashboard({
    tasks = [],
    myStudents = [],
    myClasses = [],
}) {
    return <InstructorLayout></InstructorLayout>;
}
