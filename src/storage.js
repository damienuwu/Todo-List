import Project from "./project.js";
import Todo from "./todo.js";

export default class Storage {
    static saveProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    static loadProjects() {
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        return projects.map(proj => {
            let project = new Project(proj.name);
            project.todos = proj.todos.map(todo => new Todo(todo.title, todo.description, todo.dueDate, todo.priority));
            return project;
        });
    }
}
