import InfoRow from "./InfoRow";
import { Mail, Phone } from "lucide-react";

export default function AboutSection({ user }) {
    return (
        <div className="w-full bg-white p-4 rounded-md shadow-sm flex flex-col gap-3">
            <h1 className="text-md font-semibold">About</h1>
            <InfoRow icon={Phone} label="Phone" value={user.contact_number} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
        </div>
    );
}
