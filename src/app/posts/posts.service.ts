import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from "./post.model";

@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient) {}

    getPosts() {
        // return [...this.posts]; // not reference, but new array with copied original array (trought spray operator)
        this.http
        .get<{message: string, posts: any}>(
            'http://localhost:3000/api/posts'
            )
        .pipe(map((postData) => {        // transforming post (id --> _id)
            return postData.posts.map(post => {
                return {
                    title: post.title,
                    content: post.content,
                    id: post._id
                };
            });
        }))
        .subscribe(transformedPosts => {
            this.posts = transformedPosts;
            this.postsUpdated.next([...this.posts]); // emitting event
        });

    }

    // just getter
    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    addPost(title: string, content: string) {
        const post: Post = {id: null, title: title, content: content};
        this.http
        .post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
            .subscribe((responseData) => {
                console.log(responseData.message);
                const id = responseData.postId;    // becouse at first id is null!!!
                post.id = id;
                this.posts.push(post);
                this.postsUpdated.next([...this.posts]); // emitting event
            });
    }

    deletePost(postId: string) {
        this.http.delete('http://localhost:3000/api/posts/' + postId)
            .subscribe(() => {
                const updatedPostsAfterDeleting = this.posts.filter(post => post.id !== postId);
                this.posts = updatedPostsAfterDeleting;
                this.postsUpdated.next([...this.posts]);
            });

    }
}
