import InfoRow from "./InfoRow";
import { House, Building2, MapPin } from "lucide-react";

export default function AddressSection({ user }) {
    return (
        <div className="w-full bg-white p-4 rounded-md shadow-sm flex flex-col gap-3">
            <h1 className="text-md font-semibold">Address</h1>
            <InfoRow icon={House} label="Address" value={user.address} />
            <InfoRow icon={Building2} label="City" value={user.city} />
            <InfoRow icon={MapPin} label="Zipcode" value={user.zipcode} />
        </div>
    );
}
