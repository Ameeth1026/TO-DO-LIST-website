const hamburger = document.querySelector('.bar');
const menu = document.querySelector('nav');

hamburger.addEventListener('click', () => {
    const slide_menu = menu.classList.toggle('slide_nav');
    hamburger.style.color = slide_menu ? "blueviolet" : "black";
});

const createcategory = document.querySelector('#create');
let taskCount = 0; // Initialize task counter

// Load tasks from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

createcategory.addEventListener('click', createTask);

document.querySelector('#task_input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        createTask();
    }
});

function createTask() {
    const taskinput = document.querySelector('#task_input');
    const tasktext = taskinput.value.trim();
    
    if (tasktext) {
        taskCount++; // Increment task counter
        addTask(taskCount, tasktext);
        saveTasks(); // Save tasks to localStorage
        taskinput.value = ""; 
    }
}

function addTask(number, text) {
    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-container';

    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';

    const numberDiv = document.createElement('div');
    numberDiv.className = 'task-number';
    numberDiv.textContent = `${number}`;

    const textDiv = document.createElement('div');
    textDiv.className = 'task-text';
    textDiv.textContent = text;

    taskContent.appendChild(numberDiv);
    taskContent.appendChild(textDiv);

    const task_head = document.createElement('div');
    task_head.className = "task_head";

    task_head.innerHTML =
        `<div>
            <div class="list_adder">
                <input type="text" placeholder="add your task" class="subtask-input"/>
                <button class="add-subtask-btn">add</button>
            </div>
            <ul class="subtask-list"></ul>
        </div>`;

    const storedSubtasks = JSON.parse(localStorage.getItem(`subtasks-${number}`)) || [];
    const subtaskList = task_head.querySelector('.subtask-list');
    storedSubtasks.forEach(subtask => {
        const li = createSubtaskLi(subtask.text, number, subtask.completed); // Pass the completed status
        subtaskList.appendChild(li);
    });

    const addSubtaskBtn = task_head.querySelector('.add-subtask-btn');
    const subtaskInput = task_head.querySelector('.subtask-input');

    addSubtaskBtn.addEventListener('click', () => {
        const subtaskText = subtaskInput.value.trim();
        if (subtaskText) {
            const li = createSubtaskLi(subtaskText, number);
            subtaskList.appendChild(li);
            subtaskInput.value = ""; 
        }
    });

    taskContainer.appendChild(taskContent);
    taskContainer.appendChild(task_head);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'task-buttons';

    const removebtn = document.createElement('button');
    removebtn.className = "removebtn";
    removebtn.innerHTML = '<i class="fas fa-trash"></i>';
    removebtn.onclick = function() {
        taskContainer.remove();
        taskCount--;
        renumberTasks();
        removeSubtasks(number);
        saveTasks();
    };

    const edit_btn = document.createElement('button');
    edit_btn.className = "edit_btn";
    edit_btn.innerHTML = '<i class="far fa-pen-to-square"></i>';

    const saveBtn = document.createElement('button');
    saveBtn.className = "save-btn";
    saveBtn.innerHTML = `<i class="fa-regular fa-floppy-disk"></i>`;
    
    // Create a div to show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'save-success';
    successMessage.style.display = 'none';
    successMessage.innerHTML = `<i class="fa-regular fa-circle-check"></i> saved successfully.!!`;
    document.body.appendChild(successMessage); // Append the message to the body

    saveBtn.addEventListener('click', () => {
        storeSubtasks(number, subtaskList); // Save subtasks state to localStorage
        successMessage.style.display = 'block'; // Show success message

        setTimeout(() => {
            successMessage.style.display = 'none'; // Hide after 3 seconds
        }, 3000);
    });

    buttonsDiv.appendChild(removebtn);
    buttonsDiv.appendChild(edit_btn);
    buttonsDiv.appendChild(saveBtn); // Append the save button

    edit_btn.addEventListener('click', () => {
        taskContainer.classList.toggle('zoom-in');
        task_head.classList.toggle('task_pop_show');
    });

    taskContainer.appendChild(buttonsDiv);

    document.querySelector('.category_data_view').appendChild(taskContainer);
}

function createSubtaskLi(subtaskText, taskNumber, isChecked = false) {
    const li = document.createElement('li');

    // Create the checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isChecked;
    checkbox.style.display = "none";

    // Create the star icon
    const starIcon = document.createElement('i');
    starIcon.className = 'fas fa-star';
    starIcon.style.color = isChecked ? '#FFD700' : '#CCCCCC'; // Gold if checked, light gray if not

    // Append the checkbox, star icon, and subtask text to the li
    li.appendChild(checkbox);
    li.appendChild(starIcon);
    li.appendChild(document.createTextNode(subtaskText));

    // Create the delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = `<i class="fa-regular fa-square-minus"></i>`;
    deleteBtn.className = 'delete-subtask-btn';

    deleteBtn.addEventListener('click', () => {
        li.remove();
    });

    li.appendChild(deleteBtn);

    // Toggle the star icon color based on checkbox state
    checkbox.addEventListener('change', () => {
        starIcon.style.color = checkbox.checked ? '#FFD700' : '#CCCCCC'; // Toggle color
    });

    // Toggle the checkbox state when the li is clicked
    li.addEventListener('click', () => {
        checkbox.checked = !checkbox.checked;
        starIcon.style.color = checkbox.checked ? '#FFD700' : '#CCCCCC'; // Update star color
    });

    return li;
}

function storeSubtasks(taskNumber, subtaskList) {
    const subtasks = [];
    subtaskList.querySelectorAll('li').forEach(li => {
        const subtaskText = li.childNodes[2].textContent; // Assuming text is the third child
        const isChecked = li.querySelector('input[type="checkbox"]').checked;
        subtasks.push({
            text: subtaskText.trim(),
            completed: isChecked // Save the checkbox state
        });
    });
    localStorage.setItem(`subtasks-${taskNumber}`, JSON.stringify(subtasks));
}

function removeSubtasks(taskNumber) {
    localStorage.removeItem(`subtasks-${taskNumber}`);
}

function renumberTasks() {
    const tasks = document.querySelectorAll('.task-container');
    tasks.forEach((task, index) => {
        task.querySelector('.task-number').textContent = `${index + 1}`;
    });
    saveTasks();
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-container').forEach((task) => {
        tasks.push(task.querySelector('.task-text').textContent);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (storedTasks) {
        taskCount = storedTasks.length;
        storedTasks.forEach((task, index) => {
            addTask(index + 1, task);
        });
    }
}
