import { Component, OnInit } from '@angular/core';
import { PostsService } from '../posts.service';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts-edit',
  templateUrl: './posts-edit.component.html',
  styleUrls: ['./posts-edit.component.scss']
})
export class PostsEditComponent implements OnInit {
  public post: Post;
  public coundown = 5;
  public comments: Comment[];

  constructor(private postsService: PostsService, private router: Router) {
  }

  ngOnInit() {
    this.getPost();
  }

  getPost() {
    this.postsService.getSelectedPost().subscribe(postSelected => {
      this.post = postSelected;
      if (!this.post) {
        this.setCountDown();
        this.navigateToHomeAfterTimeOut(this.coundown * 1000);
      }
    });
  }

  // getComments(postId: number) {
  //   this.postsService.getCommentsOfPostId(postId).subscribe(comments => {
  //     this.comments = comments;
  //   }, () => {
  //     window.alert('Error fetching comment');
  //   });
  // }

  setCountDown() {
    setInterval(() => {
      this.coundown -= 0.1;
    }, 100);
  }

  navigateToHomeAfterTimeOut(time: number) {
    setTimeout(() => {
      this.router.navigateByUrl('/');
    }, time);
  }

  updatePost(post: Post) {
    this.postsService.updatePost(post).subscribe(() => {
      this.setCountDown();
      alert('Successfully edited');
    }, error => {
      alert('Edit Error');
    });
  }
}
