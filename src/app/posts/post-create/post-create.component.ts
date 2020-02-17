import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostsService } from '../posts.service';

// import {Post} from '../post.model';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent{
    enteredTitle = '';
    enteredContent = '';
    // @Output() postCreatedEvent = new EventEmitter<Post>();
    postCreatedEvent = new EventEmitter<Post>();

    constructor(public postService: PostsService) { }

    onAddPost(form: NgForm) {
        if (form.invalid) {
            return;
        }
        // const post: Post = {
        //     title: form.value.title,
        //     content: form.value.content
        // };
        // this.postCreatedEvent.emit(post);
        this.postService.addPost(form.value.title, form.value.content);
        form.reset();
    }
}
