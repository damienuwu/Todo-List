import UI from "./ui.js";
import Project from "./project.js";
import Storage from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("projects")) {
        let defaultProject = new Project("Default Project");
        Storage.saveProjects([defaultProject]);
    }

    UI.renderProjects(); // ✅ Corrected function name
});

document.getElementById("newProjectBtn").addEventListener("click", () => {
    const projectName = prompt("Enter project name:");
    if (projectName) {
        const projects = Storage.loadProjects();
        const newProject = new Project(projectName);
        projects.push(newProject);
        Storage.saveProjects(projects);
        UI.renderProjects(); // ✅ Corrected function name
    }
});
