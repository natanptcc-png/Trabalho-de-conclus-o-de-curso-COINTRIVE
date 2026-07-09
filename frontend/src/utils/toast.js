import { toast } from "react-toastify";

export const showToast = ({ type = "success", message, title }) => {
    const content = title ? `${title}: ${message}` : message;

    if (type === "success") {
        toast.success(content);
        return;
    }

    if (type === "error") {
        toast.error(content);
        return;
    }

    if (type === "info") {
        toast.info(content);
        return;
    }

    toast(content);
};
