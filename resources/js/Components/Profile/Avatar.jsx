export default function Avatar({ user }) {
    return user?.profile_picture ? (
        <img
            src={`/${user.profile_picture}`}
            alt="Profile"
            className="w-24 h-24 rounded-md"
        />
    ) : (
        <div className="w-10 h-10 rounded-md bg-bluepsu flex items-center justify-center text-white font-semibold text-lg">
            {user?.firstname?.charAt(0).toUpperCase()}
        </div>
    );
}
