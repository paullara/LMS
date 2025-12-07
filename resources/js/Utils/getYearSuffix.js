export default function getYearSuffix(num) {
    switch (num) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        case 4:
            return "th";
        default:
            return "";
    }
}
