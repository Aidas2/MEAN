import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from './post.model';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

    constructor(private http: HttpClient, private router: Router) { }

    getPosts(postsPerPage: number, currentPage: number) {
        // return [...this.posts]; // not reference, but new array with copied original array (trought spray operator)
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http
            .get<{ message: string; posts: any; maxPosts: number }>(
              BACKEND_URL + queryParams
            )
            .pipe(                // transforming post (id --> _id)
            map(postData => {
                return {
                  posts: postData.posts.map(post => {
                    return {
                      title: post.title,
                      content: post.content,
                      id: post._id,
                      imagePath: post.imagePath,
                      creator: post.creator
                    };
                  }),
                  maxPosts: postData.maxPosts
                };
              })
            )
            .subscribe(transformedPostData => {
              this.posts = transformedPostData.posts;
              this.postsUpdated.next({    // emitting event
                posts: [...this.posts],
                postCount: transformedPostData.maxPosts
              });
            });
        }

    // just getter
    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string) {
        // return {...this.posts.find(p => p.id === id)};     // copy of object. also not from backend?! also interesting iterration !!!
        return this.http.get<{    // getting from backend.
            _id: string;          // as Observable (threfore must sunbscribe when using this method)!!!
            title: string;
            content: string;
            imagePath: string;
            creator: string;
        }>(BACKEND_URL + id);
    }

    addPost(title: string, content: string, image: File) {
        // const post: Post = {id: null, title: title, content: content};
        const postData = new FormData();
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);
        this.http
            .post<{ message: string, post: Post }>(
                BACKEND_URL,
                postData
            )
            .subscribe(responseData => {
                /* //not required anymore cos we go to the page where we fetch latest version anyways
                console.log(responseData.message);
                const post: Post = {
                    id: responseData.post.id,
                    title: title,
                    content: content,
                    imagePath: responseData.post.id };
                // const id = responseData.postId;    // becouse at first id is null!!!
                // post.id = id;
                this.posts.push(post);
                this.postsUpdated.next([...this.posts]); // emitting event
                */
                this.router.navigate(['/']);
            });
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData: Post | FormData;
        if (typeof(image) === 'object') {
            postData = new FormData();
            postData.append("id", id);
            postData.append("title", title);
            postData.append("content", content);
            postData.append("image", image, title);
        } else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image,
                creator: null
            };
        }
        this.http
            .put(BACKEND_URL + id, postData)
            .subscribe(response => {
                /* //not required anymore cos we go to the page where we fetch latest version anyways
                console.log(response);
                const updatedPostsAfterEditing = [...this.posts];
                const oldPostIndex = updatedPostsAfterEditing.findIndex(p => p.id === id); // interesting iterration !!!
                const post: Post = {
                    id: id,
                    title: title,
                    content: content,
                    imagePath: ''
                };
                updatedPostsAfterEditing[oldPostIndex] = post;
                this.posts = updatedPostsAfterEditing;
                this.postsUpdated.next([...this.posts]);
                */
                this.router.navigate(['/']);
            });
    }

    deletePost(postId: string) {
        /* before pagination
        this.http.delete(BACKEND_URL + postId)
            .subscribe(() => {
                const updatedPostsAfterDeleting = this.posts.filter(post => post.id !== postId);
                this.posts = updatedPostsAfterDeleting;
                this.postsUpdated.next([...this.posts]);
            });
        */
       return this.http
           .delete(BACKEND_URL + postId);

    }
}
