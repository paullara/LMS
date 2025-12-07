import React from "react";

export default function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-500" />
            <p className="text-gray-500">
                {label}: <span className="text-black ml-1">{value}</span>
            </p>
        </div>
    );
}
