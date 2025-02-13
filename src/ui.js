import Todo from "./todo.js";
import Storage from "./storage.js";

export default class UI {
    static showAddTodoModal(projectIndex) {
        if (projectIndex === undefined) {
            console.error("Invalid project index.");
            return;
        }

        const modal = document.createElement("div");
        modal.className = "fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4";

        modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 class="text-xl font-semibold mb-4">Add New Todo</h2>
                <form id="todoForm" class="flex flex-col gap-3">
                    <input type="text" id="todoTitle" placeholder="Title" required class="border p-2 rounded">
                    <input type="text" id="todoDescription" placeholder="Description" class="border p-2 rounded">
                    <input type="date" id="todoDueDate" required class="border p-2 rounded">
                    <select id="todoPriority" class="border p-2 rounded">
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                    <div class="flex justify-end gap-2">
                        <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
                            Add Todo
                        </button>
                        <button type="button" id="closeModal" class="text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("closeModal").addEventListener("click", () => modal.remove());

        document.getElementById("todoForm").addEventListener("submit", (e) => {
            e.preventDefault();
            UI.addTodo(projectIndex);
            modal.remove();
        });
    }

    static addTodo(projectIndex) {
        const title = document.getElementById("todoTitle").value.trim();
        const description = document.getElementById("todoDescription").value.trim();
        const dueDate = document.getElementById("todoDueDate").value;
        const priority = document.getElementById("todoPriority").value;

        if (!title || !dueDate) {
            alert("Title and Due Date are required.");
            return;
        }

        const projects = Storage.loadProjects();
        if (!projects[projectIndex]) {
            console.error("Project not found.");
            return;
        }

        const newTodo = new Todo(title, description, dueDate, priority, false);
        projects[projectIndex].todos.push(newTodo);
        Storage.saveProjects(projects);
        UI.renderProjects(); // ✅ Update the UI after adding a todo
    }

    static renderProjects() {
        const projects = Storage.loadProjects();
        const projectContainer = document.getElementById("projectContainer");
        if (!projectContainer) {
            console.error("Project container not found!");
            return;
        }

        projectContainer.innerHTML = ""; // Clear existing projects

        projects.forEach((project, projectIndex) => {
            const projectElement = document.createElement("div");
            projectElement.className = "p-4 bg-gray-100 rounded shadow mt-4";
            projectElement.innerHTML = `
                <h2 class="text-lg font-semibold">${project.name}</h2>
                <div id="todoContainer-${projectIndex}" class="mt-2"></div>
                <div class="flex gap-2 mt-2">
                    <button class="add-todo-btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" data-project-index="${projectIndex}">
                        Add Todo
                    </button>
                    <button class="delete-project-btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700" data-project-index="${projectIndex}">
                        Delete Project
                    </button>
                </div>
            `;

            projectContainer.appendChild(projectElement);

            // Add event listeners
            projectElement.querySelector(".add-todo-btn").addEventListener("click", (event) => {
                const index = event.target.getAttribute("data-project-index");
                UI.showAddTodoModal(index);
            });

            projectElement.querySelector(".delete-project-btn").addEventListener("click", (event) => {
                const index = event.target.getAttribute("data-project-index");
                UI.deleteProject(index);
            });

            // Render todos for this project
            project.todos.forEach((todo, todoIndex) => {
                UI.displayTodo(projectIndex, todo, todoIndex);
            });
        });
    }



    static displayTodo(projectIndex, todo, todoIndex) {
        const todoContainer = document.getElementById(`todoContainer-${projectIndex}`);
        if (!todoContainer) return;

        const todoElement = document.createElement("div");

        const priorityColors = {
            low: "border-green-500",
            medium: "border-yellow-500",
            high: "border-red-500",
        };

        todoElement.className = `p-4 border-l-4 ${priorityColors[todo.priority]} bg-white rounded shadow mt-2 flex justify-between items-center`;

        todoElement.innerHTML = `
            <div>
                <h3 class="font-semibold">${todo.title}</h3>
                <p class="text-sm text-gray-600">${todo.description || "No description"}</p>
                <p class="text-xs text-gray-400">Due: ${todo.dueDate}</p>
            </div>
        `;

        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = todo.completed ? "Undo" : "Complete";
        toggleBtn.className = "px-3 py-1 text-white rounded " + (todo.completed ? "bg-gray-500" : "bg-yellow-500");
        toggleBtn.addEventListener("click", () => UI.toggleComplete(projectIndex, todoIndex));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "px-3 py-1 bg-red-500 text-white rounded";
        deleteBtn.addEventListener("click", () => UI.deleteTodo(projectIndex, todoIndex));

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "flex gap-2";
        buttonContainer.appendChild(toggleBtn);
        buttonContainer.appendChild(deleteBtn);

        todoElement.appendChild(buttonContainer);
        todoContainer.appendChild(todoElement);
    }

    static toggleComplete(projectIndex, todoIndex) {
        const projects = Storage.loadProjects();
        if (!projects[projectIndex] || !projects[projectIndex].todos[todoIndex]) {
            console.error("Invalid Todo or Project index.");
            return;
        }

        projects[projectIndex].todos[todoIndex].completed = !projects[projectIndex].todos[todoIndex].completed;
        Storage.saveProjects(projects);
        UI.renderProjects(); // ✅ Refresh UI
    }

    static deleteTodo(projectIndex, todoIndex) {
        const projects = Storage.loadProjects();
        if (!projects[projectIndex] || !projects[projectIndex].todos[todoIndex]) {
            console.error("Invalid Todo or Project index.");
            return;
        }

        projects[projectIndex].todos.splice(todoIndex, 1);
        Storage.saveProjects(projects);
        UI.renderProjects(); // ✅ Refresh UI
    }
    
    static deleteProject(projectIndex) {
        const projects = Storage.loadProjects();
        
        if (!projects[projectIndex]) {
            console.error("Project not found.");
            return;
        }
    
        // Confirm before deleting
        const confirmDelete = confirm(`Are you sure you want to delete the project: "${projects[projectIndex].name}"?`);
        if (!confirmDelete) return;
    
        // Remove project from array
        projects.splice(projectIndex, 1);
        
        // Save updated list & refresh UI
        Storage.saveProjects(projects);
        UI.renderProjects();
    }
    
}
