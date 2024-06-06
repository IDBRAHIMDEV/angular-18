import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent implements OnInit {
  todos = signal<Todo[]>([]);

  editable = signal<boolean>(false);

  openForm = signal<boolean>(false);

  todo = signal<Todo>({
    title: '',
    completed: false,
  });

  // constructor(private todoService: TodoService) {}
  todoService = inject(TodoService);

  ngOnInit(): void {
    this.getAllTodos();
  }

  addTodo() {
    this.todoService.persistTodo(this.todo()).subscribe({
      next: (data) => {
        this.getAllTodos();
      },
      error: () => {},
      complete: () => {},
    });
  }

  getAllTodos() {
    this.todoService.getTodos().subscribe({
      next: (data) => {
        console.log(data);
        this.todos.set(
          data.sort((a, b) =>
            a.completed > b.completed ? 1 : a.completed < b.completed ? -1 : 0
          )
        );
      },
    });
  }

  editTodo(data: Todo) {
    this.todo.set(data);
    this.editable.set(true);
    this.openForm.set(true);
  }

  updateTodo() {
    let { id, title, completed } = this.todo();
    if (id) {
      this.todoService.changeTodo(id, { title, completed }).subscribe({
        next: (data) => {
          this.getAllTodos();
          this.initTodo();
        },
      });
    }
  }

  initTodo() {
    this.todo.set({
      title: '',
      completed: false,
    });

    this.editable.set(false);
    this.openForm.set(false);
  }

  completeTodo(todo: Todo) {
    let { id, title, completed } = todo;
    if (id) {
      this.todoService
        .changeTodo(id, { title, completed: !completed })
        .subscribe({
          next: (data) => {
            this.getAllTodos();
          },
        });
    }
  }

  toggleForm() {
    this.openForm.set(true);
  }

  deleteTodo(todo: Todo) {
    if (!confirm('Are you sure to delete this todo ' + todo.title)) {
      return;
    }

    if (todo.id && !todo.completed) {
      this.todoService.destroyTodo(todo.id).subscribe({
        next: (data) => {
          this.getAllTodos();
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
