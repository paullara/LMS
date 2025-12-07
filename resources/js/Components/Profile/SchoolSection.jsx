import InfoRow from "./InfoRow";
import { BookOpen, School, GraduationCap } from "lucide-react";
import getYearSuffix from "@/Utils/getYearSuffix";

export default function SchoolSection({ user, authUser }) {
    const isStudent = authUser.role === "student";
    return (
        <div className="w-full bg-white p-4 rounded-md shadow-sm flex flex-col gap-3">
            <h1 className="text-md font-semibold">School Details</h1>

            <InfoRow icon={BookOpen} label="Course" value={user.course} />
            <InfoRow icon={School} label="Campus" value={user.campus} />
            {isStudent && (
                <InfoRow
                    icon={GraduationCap}
                    label="Year Level"
                    value={`${user.year_level}${getYearSuffix(
                        user.year_level
                    )} year`}
                />
            )}
        </div>
    );
}
