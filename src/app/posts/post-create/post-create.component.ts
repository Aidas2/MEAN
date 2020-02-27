import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { AuthService } from './../../auth/auth.service';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {

    enteredTitle = '';
    enteredContent = '';
    // @Output() postCreatedEvent = new EventEmitter<Post>();
    // postCreatedEvent = new EventEmitter<Post>();
    post: Post;
    isLoading = false;
    form: FormGroup;
    imagePreview: string;
    private mode = 'create';
    private postId: string;
    private authStatusSub: Subscription;

    constructor(
        public postsService: PostsService,
        public route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.authStatusSub = this.authService
            .getAuthStatusListener()
            .subscribe(
                authStatus => {
                    this.isLoading = false;
                }
            );
        this.form = new FormGroup({
            title: new FormControl(null, {
                validators: [Validators.required, Validators.minLength(3)]
            }),
            content: new FormControl(null, {
                validators: [Validators.required]
            }),
            image: new FormControl(null, {
                validators: [Validators.required],
                asyncValidators: [mimeType]
            })
        });
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe(postData => {
                    this.isLoading = false;
                    this.post = {            // filling edit form!!! also [ngModel]="post?.title"
                        id: postData._id,
                        title: postData.title,
                        content: postData.content,
                        imagePath: postData.imagePath,
                        creator: postData.creator
                    };
                    this.form.setValue({    // or here: filling edit form!!!
                        title: this.post.title,
                        content: this.post.content,
                        image: this.post.imagePath
                    });
                });
            } else {
                this.mode = 'create';
                this.postId = null;
            }
        });
    }

    onImagePicked(event: Event) {
        const file = (event.target as HTMLInputElement).files[0];
        this.form.patchValue({image: file});
        this.form.get('image').updateValueAndValidity();
        // console.log(file);
        // console.log(this.form);
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    // TEMPLATE DRIVEN APRROACH
    // onSavePost(form: NgForm) {
    //     if (form.invalid) {
    //         return;
    //     }
    //     // const post: Post = {
    //     //     title: form.value.title,
    //     //     content: form.value.content
    //     // };
    //     // this.postCreatedEvent.emit(post);

    //     this.isLoading = true;
    //     if (this.mode === 'create') {
    //         this.postsService.addPost(form.value.title, form.value.content);
    //     } else {
    //         this.postsService.updatePost(this.postId, form.value.title, form.value.content);
    //     }
    //     form.resetForm();
    // }
    // REACTIVE APRROACH
    onSavePost() {
        if (this.form.invalid) {
            return;
        }
        this.isLoading = true;
        if (this.mode === 'create') {
            this.postsService.addPost(
                this.form.value.title,
                this.form.value.content,
                this.form.value.image);
        } else {
            this.postsService.updatePost(
                this.postId,
                this.form.value.title,
                this.form.value.content,
                this.form.value.image
            );
        }
        this.form.reset();
    }

    ngOnDestroy(): void {
        this.authStatusSub.unsubscribe();
    }
}
