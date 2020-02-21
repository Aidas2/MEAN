import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient, private router: Router) { }

    getPosts() {
        // return [...this.posts]; // not reference, but new array with copied original array (trought spray operator)
        this.http
            .get<{ message: string, posts: any }>(
                'http://localhost:3000/api/posts'
            )
            .pipe(map(postData => {        // transforming post (id --> _id)
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

    getPost(id: string) {
        // return {...this.posts.find(p => p.id === id)};     // copy of object. also not from backend?! also interesting iterration !!!
        return this.http.get<{ _id: string, title: string, content: string }>(    // getting from backend.
            'http://localhost:3000/api/posts/' + id                           // as Observable (threfore must sunbscribe when using this method)!!!
        );
    }

    addPost(title: string, content: string, image: File) {
        // const post: Post = {id: null, title: title, content: content};
        const postData = new FormData();
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);
        this.http
            .post<{ message: string, postId: string }>(
                'http://localhost:3000/api/posts',
                postData
            )
            .subscribe(responseData => {
                console.log(responseData.message);
                const post: Post = {
                    id: responseData.postId,
                    title: title,
                    content: content };
                // const id = responseData.postId;    // becouse at first id is null!!!
                // post.id = id;
                this.posts.push(post);
                this.postsUpdated.next([...this.posts]); // emitting event
                this.router.navigate(['/']);
            });
    }

    updatePost(id: string, title: string, content: string) {
        const post: Post = { id: id, title: title, content: content };
        this.http.put('http://localhost:3000/api/posts/' + id, post)
            .subscribe(response => {
                // console.log(response);
                const updatedPostsAfterEditing = [...this.posts];
                const oldPostIndex = updatedPostsAfterEditing.findIndex(p => p.id === post.id); // interesting iterration !!!
                updatedPostsAfterEditing[oldPostIndex] = post;
                this.posts = updatedPostsAfterEditing;
                this.postsUpdated.next([...this.posts]);
                this.router.navigate(['/']);
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
