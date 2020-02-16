import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  constructor() { }

  // posts = [
  //   { title: 'Firt Post', content: 'This is the first post content!'},
  //   { title: '2 Post', content: 'This is the 2 post content!'},
  //   { title: '3 Post', content: 'This is the 3 post content!'},
  // ];

  @Input()
  posts = [];

  ngOnInit(): void {
  }

}
