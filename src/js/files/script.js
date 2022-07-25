// Подключение функционала "Чертогов Фрилансера"
import { isMobile } from "./functions.js";
// Подключение списка активных модулей
import { flsModules } from "./modules.js";

import Sortable from 'sortablejs';
window.onload = function () {
    document.addEventListener("click", documentActions);

    function documentActions(e) {
        const targetElement = e.target;

        if (window.innerWidth > 768 && isMobile.any()) {
            if (document.documentElement.classList.contains('lock') && !targetElement.closest(".icon-menu") && !targetElement.closest(".header") && !targetElement.closest(".left-bar")) {
                document.querySelector(".menu-open").classList.remove("lock", "menu-open");
            }
        }

        if (targetElement.classList.contains("todo_add")) {
            addTaskHandler();
            e.preventDefault();
        }
        if (targetElement.classList.contains("show-all__btn")) {
            showAllHandler();
            e.preventDefault();
        }
        if (targetElement.classList.contains("show-no__btn")) {
            showNotCompletedHandler();
            e.preventDefault();
        }
        if (targetElement.classList.contains("delete-all__btn")) {
            deleteAllHandler();
            e.preventDefault();
        }
    }
}
class Task {
    constructor(text) {
        this.text = text;
        this.isDone = false;
    }
}

let dataService = {
    tasks: [],

    get allTasks() {
        return this.tasks;
    },

    get notCompletedTasks() {
        return this.tasks.filter(task => task.isDone == false);
    },

    get notDaletedTasks() {
        this.tasks = this.tasks.filter(task => task.text !== "");
        return this.tasks;
    },

    add(task) {
        this.tasks.push(task);
        this.save();
    },

    save() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    },

    open() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    },

    dalete(array) {
        localStorage.clear();
        if (array.length !== 0) {
            localStorage.setItem("tasks", JSON.stringify(array));
        }
    }
}

class TasksListView {
    element;

    constructor(element) {
        this.element = element;
    }

    #drawList(tasksElements) {
        this.element.innerHTML = "";
        tasksElements.forEach(taskElement => {
            taskElement.createIn(this.element);
        });
    }

    #drawListItem(taskNew) {
        taskNew.createIn(this.element);
    }

    drawAll() {
        let taskElements = [];
        let tasks = dataService.allTasks;
        if (tasks.length == 0) return;

        tasks.forEach(task => {
            taskElements.push(new TaskView(task))
        });
        this.#drawList(taskElements);
    }

    drawItem(task) {
        let newTask = new TaskView(task);
        this.#drawListItem(newTask);
    }

    drawNotCompleted() {
        let taskElements = [];
        let tasks = dataService.notCompletedTasks;
        if (tasks.length == 0) return;

        tasks.forEach(task => {
            taskElements.push(new TaskView(task))
        });
        this.#drawList(taskElements);
    }

    drawNotDaleted() {
        let taskElements = [];
        let tasks = dataService.notDaletedTasks;
        dataService.dalete(tasks);
    }
}

class TaskView {
    constructor(task) {
        this.task = task;
        this.div = null;
    }

    createIn(element) {
        this.div = document.createElement("div");
        this.div.classList.add("todo_item");
        let aIconSymbol = document.createElement("a");
        aIconSymbol.classList.add("_icon-x-symbol");

        aIconSymbol.addEventListener("click", (e) => {
            this.daleteItem(this);
            e.preventDefault();
        })

        let input = document.createElement("input");
        input.classList.add("todo_input");
        input.addEventListener("click", this.changeState.bind(this));
        input.type = "checkbox";

        let p = document.createElement("p");
        p.classList.add("todo_text");
        p.innerText = this.task.text;

        this.div.append(aIconSymbol);
        this.div.append(input);
        this.div.append(p);

        if (this.task.isDone) {
            this.div.classList.add("completed");
            input.checked = true;
        }
        element.append(this.div);
    }

    changeState(element) {
        this.task.isDone = !this.task.isDone;
        dataService.save();
        this.div.classList.toggle("completed");
    }

    daleteItem(element) {
        this.task.text = "";
        this.div.remove();
        tasksListView.drawNotDaleted();
    }
}

let taskNameInput = document.querySelector("#task-name-input");
let startMessage = document.querySelector("#start-message");
let taskList = document.querySelector(".task-list");

dataService.open();
let tasksListView = new TasksListView(taskList);

window.addEventListener("load", function () {
    tasksListView.drawAll();
});

taskNameInput.addEventListener("keydown", function (e) {
    if (e.code == "Enter") addTaskHandler();
})

function addTaskHandler() {
    if (taskNameInput.value) {
        if (!startMessage.hidden) startMessage.hidden = true;

        let newTask = new Task(taskNameInput.value);
        dataService.add(newTask);
        tasksListView.drawItem(newTask);

        taskNameInput.value = "";
    } else {
        alert("введите имя задачи");
    }
}

function showAllHandler() {
    tasksListView.drawAll();
}

function showNotCompletedHandler() {
    tasksListView.drawNotCompleted();
}

function deleteAllHandler() {
    let nullTasksArr = dataService.tasks = [];
    dataService.dalete(nullTasksArr);
    tasksListView.element.innerHTML = "";
}

new Sortable(taskList, {
    animation: 300,
    ghostClass: 'blue-background-class'
});