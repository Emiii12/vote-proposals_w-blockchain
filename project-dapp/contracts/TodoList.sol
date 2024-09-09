//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract TodoList {
    struct Task {
        uint id;
        string content;
        bool completed;
    }

    event TaskCreated (
        uint id,
        string content,
        bool completed
    );

    event TaskCompleted (
        uint id,
        bool completed
    );

    mapping(address => mapping(uint => Task)) public tasks;
    mapping(address => uint) public tasksCount;

    constructor() {
        createTask("Hola mundo!");
    }

    function createTask(string memory _content) public {
        uint taskCount = tasksCount[msg.sender];
        tasks[msg.sender][taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
        tasksCount[msg.sender]++;
    }

    function toggleCompleted(uint _id) public {
        Task memory task = tasks[msg.sender][_id];
        task.completed = !task.completed;
        tasks[msg.sender][_id] = task;
        emit TaskCompleted(_id, task.completed);
    }
}