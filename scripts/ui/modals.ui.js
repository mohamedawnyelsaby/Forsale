// PATH: scripts/ui/modals.ui.js

export const Modals = {
    open(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = "block";
    },

    close(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = "none";
    }
};
