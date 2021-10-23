var pageContentEl = document.querySelector('#page-content')

var taskIdCounter = 0
var formEl = document.querySelector('#task-form')
var tasksToDoEl = document.querySelector('#tasks-to-do')
var tasksInProgressEl = document.querySelector('#tasks-in-progress')
var tasksCompletedEl = document.querySelector('#tasks-completed')

var tasks = []

var taskFormHandler = function (event) {
  event.preventDefault()

  var taskNameInput = document.querySelector('input[name=\'task-name\']').value
  var taskTypeInput = document.querySelector('select[name=\'task-type\']').value

  if (!taskNameInput || !taskTypeInput) {
    alert('You need to fill out the task form!')
    return false
  }

  formEl.reset()

  var isEdit = formEl.hasAttribute('data-task-id')

  // has data attribute, so get task id and call fxn to complete edit process
  if (isEdit) {
    var taskId = formEl.getAttribute('data-task-id')
    completeEditTask(taskNameInput, taskTypeInput, taskId)
  }
  // no data attribute, so create object as normal and pass to createTaskEl fxn
  else {
    var taskDataObj = {
      name: taskNameInput,
      type: taskTypeInput,
      // because this gets sent to createTaskEl the task will always have a status of to do since a newly created task can't be "in progress" or "completed"
      status: 'to do'
    }
    createTaskEl(taskDataObj)
  }
}

var completeEditTask = function (taskName, taskType, taskId) {
  var taskSelected = document.querySelector('.task-item[data-task-id=\'' + taskId + '\']')

  taskSelected.querySelector('h3.task-name').textContent = taskName
  taskSelected.querySelector('span.task-type').textContent = taskType

  // loop through tasks array and task object with new content
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].name = taskName
      tasks[i].type = taskType
    }
  }

  saveTasks()

  alert('Task Updated!')

  formEl.removeAttribute('data-task-id')
  document.querySelector('#save-task').textContent = 'Add Task'
}

var createTaskEl = function (taskDataObj) {
  // create list item
  var listItemEl = document.createElement('li')
  listItemEl.className = 'task-item'

  // add task id as custom attribute
  listItemEl.setAttribute('data-task-id', taskIdCounter)

  // create div to hold task info and add to list item
  var taskInfoEl = document.createElement('div')
  taskInfoEl.className = 'task-info'

  taskInfoEl.innerHTML = '<h3 class=\'task-name\'>' + taskDataObj.name + '</h3><span class=\'task-type\'>' + taskDataObj.type + '</span>'
  listItemEl.appendChild(taskInfoEl)

  // assign the completed actionContainerEl with the associated task id to an element we can add to our task list
  var taskActionsEl = createTaskActions(taskIdCounter)
  listItemEl.appendChild(taskActionsEl)

  // add entire list item to list
  tasksToDoEl.appendChild(listItemEl)

  taskDataObj.id = taskIdCounter

  tasks.push(taskDataObj)

  saveTasks()

  taskIdCounter++
}

// parameter of taskId is how we pass a different id to the fxn to keep track of which elements we're creating for which task
var createTaskActions = function (taskId) {
  var actionContainerEl = document.createElement('div')
  actionContainerEl.className = 'task-actions'

  var editButtonEl = document.createElement('button')
  editButtonEl.textContent = 'Edit'
  editButtonEl.className = 'btn edit-btn'
  editButtonEl.setAttribute('data-task-id', taskId)

  actionContainerEl.appendChild(editButtonEl)

  var deleteButtonEl = document.createElement('button')
  deleteButtonEl.textContent = 'Delete'
  deleteButtonEl.className = 'btn delete-btn'
  deleteButtonEl.setAttribute('data-task-id', taskId)

  actionContainerEl.appendChild(deleteButtonEl)

  var statusSelectEl = document.createElement('select')
  statusSelectEl.className = 'select-status'
  statusSelectEl.setAttribute('name', 'status-change')
  statusSelectEl.setAttribute('data-task-id', taskId)

  var statusChoices = ['To Do', 'In Progress', 'Completed']

  for (var i = 0; i < statusChoices.length; i++) {
    // create new option element
    var statusOptionEl = document.createElement('option')

    // add text content to option element
    statusOptionEl.textContent = statusChoices[i]

    // set value attribute for option element to be the same as the text content (the array item name)
    statusOptionEl.setAttribute('value', statusChoices[i])

    // append option element to select element
    statusSelectEl.appendChild(statusOptionEl)
  }

  actionContainerEl.appendChild(statusSelectEl)

  return actionContainerEl
}

var taskButtonHandler = function (event) {
  var targetEl = event.target

  // edit button clicked
  if (targetEl.matches('.edit-btn')) {
    var taskId = targetEl.getAttribute('data-task-id')
    editTask(taskId)
  }

  // delete button clicked
  else if (targetEl.matches('.delete-btn')) {
    var taskId = targetEl.getAttribute('data-task-id')
    deleteTask(taskId)
  }
}

var deleteTask = function (taskId) {
  var taskSelected = document.querySelector('.task-item[data-task-id=\'' + taskId + '\']')
  taskSelected.remove()

  var updatedTaskArray = []
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== parseInt(taskId)) {
      updatedTaskArray.push(tasks[i])
    }
  }

  tasks = updatedTaskArray

  saveTasks()
}

var editTask = function (taskId) {
  var taskSelected = document.querySelector('.task-item[data-task-id=\'' + taskId + '\']')

  // get content from task name and type
  var taskName = taskSelected.querySelector('h3.task-name').textContent
  var taskType = taskSelected.querySelector('span.task-type').textContent

  // assign the content from above to the input and select options in our form
  document.querySelector('input[name=\'task-name\']').value = taskName
  document.querySelector('select[name=\'task-type\']').value = taskType

  document.querySelector('#save-task').textContent = 'Save Task'

  // add the task's id to save the changes to correct task
  formEl.setAttribute('data-task-id', taskId)
}

var taskStatusChangeHandler = function (event) {
  var taskId = event.target.getAttribute('data-task-id')

  // get the currently selected option's value and convert to lowercase
  var statusValue = event.target.value.toLowerCase()

  // find the parent task item element based on the id
  var taskSelected = document.querySelector('.task-item[data-task-id=\'' + taskId + '\']')

  if (statusValue === 'to do') {
    tasksToDoEl.appendChild(taskSelected)
  }
  else if (statusValue === 'in progress') {
    tasksInProgressEl.appendChild(taskSelected)
  }
  else if (statusValue === 'completed') {
    tasksCompletedEl.appendChild(taskSelected)
  }

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].status = statusValue
    }
  }
  saveTasks()
}

var saveTasks = function () {
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

var loadTasks = function () {
  // load tasks from local storage
  var savedTasks = localStorage.getItem('tasks')

  if (!savedTasks) {
    return false
  }

  savedTasks = JSON.parse(savedTasks)

  for (var i = 0; i < savedTasks.length; i++) {
    // pass each task object into the createTaskEl fxn
    createTaskEl(savedTasks[i])
  }
}

formEl.addEventListener('submit', taskFormHandler)
pageContentEl.addEventListener('click', taskButtonHandler)
pageContentEl.addEventListener('change', taskStatusChangeHandler)

loadTasks()
