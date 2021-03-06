import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsEditComponent } from './posts-edit.component';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../posts.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PostsMock } from 'src/app/testing/PostsMock';
import { IntructionsHelper } from 'src/app/testing/InstructionsHelper';
import { Component } from '@angular/core';

describe('PostsEditComponent', () => {
  let component: PostsEditComponent;
  let fixture: ComponentFixture<PostsEditComponent>;
  let postServiceMock: any;
  let getSelectedPostMock: any;
  let updatePostMock: any;
  let getCommentsOfPostIdMock: any;
  let router: Router;
  let location: Location;
  let postsMock: PostsMock;
  let htmlUtil: IntructionsHelper<PostsEditComponent>;
  beforeEach(async(() => {
    postServiceMock = jasmine.createSpyObj('PostsService', ['getSelectedPost', 'updatePost', 'getCommentsOfPostId']);
    getSelectedPostMock = jasmine.createSpyObj('getSelectedPost', ['subscribe']);
    updatePostMock = jasmine.createSpyObj('updatePost', ['subscribe']);
    getCommentsOfPostIdMock = jasmine.createSpyObj('getCommentsOfPostId', ['subscribe']);
    postServiceMock.getSelectedPost.and.returnValue(getSelectedPostMock);
    postServiceMock.updatePost.and.returnValue(updatePostMock);
    postServiceMock.getCommentsOfPostId.and.returnValue(getCommentsOfPostIdMock);
    getSelectedPostMock.subscribe.and.returnValue([]);
    updatePostMock.subscribe.and.returnValue([]);
    getCommentsOfPostIdMock.subscribe.and.returnValue([]);
    TestBed.configureTestingModule({
      declarations: [PostsEditComponent, MockComponent],
      imports: [
        FormsModule, RouterTestingModule.withRoutes([
          {
            path: '',
            component: MockComponent
          }, {
            path: 'manage',
            component: PostsEditComponent
          }
        ])
      ],
      providers: [
        {
          provide: PostsService,
          useValue: postServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsEditComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    location = TestBed.get(Location);
  });

  describe('Init status', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('HTML DOM', () => {
    beforeEach(() => {
      postsMock = new PostsMock();
      htmlUtil = new IntructionsHelper(fixture);
    });

    describe('HTML DOM without post', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });

      it('should show no selected post title', () => {
        expect(htmlUtil.singleText('h3.no-selection')).toEqual('No selected post');
      });

      it('should show go-back btn', () => {
        expect(htmlUtil.singleText('button.no-selection-btn-nav')).toEqual('Go back');
      });

      it('should show count down', () => {
        expect(htmlUtil.singleText('.count-down')).toBeTruthy();
      });

      it('should navigate when go-back button is clicked', () => {
        spyOn(router, 'navigateByUrl');
        htmlUtil.clickEvent('button.no-selection-btn-nav');
        fixture.detectChanges();
        expect(router.navigateByUrl).toHaveBeenCalledWith(router.createUrlTree(['../']), {
          skipLocationChange: false,
          replaceUrl: false
        });
      });

    });

    describe('HTML DOM with post', () => {
      beforeEach(() => {
        component.post = postsMock.getOnePostWithId(2);
        fixture.detectChanges();
      });

      it('should show title input', done => {
        fixture.whenStable().then(() => {
          expect(htmlUtil.getInputValue('input.title-input')).toEqual(postsMock.getOnePostWithId(2).title);
          done();
        });
      });

      it('should show post body on textarea input', done => {
        fixture.whenStable().then(() => {
          expect(htmlUtil.getInputValue('textarea')).toEqual(postsMock.getOnePostWithId(2).body);
          done();
        });
      });

      it('should show go-back button', () => {
        expect(htmlUtil.singleText('button.go-back-main')).toEqual('Go back');
      });

      it('should go-back when go-back button is  clicked', () => {
        spyOn(router, 'navigateByUrl');
        htmlUtil.clickEvent('button.go-back-main');
        fixture.detectChanges();
        expect(router.navigateByUrl).toHaveBeenCalledWith(router.createUrlTree(['../']), {
          skipLocationChange: false,
          replaceUrl: false
        });
      });

      it('should show Edit button', () => {
        expect(htmlUtil.singleText('button.edit-button')).toEqual('Edit Post');
      });

      it('should call update post with post', () => {
        spyOn(component, 'updatePost');
        htmlUtil.clickEvent('button.edit-button');
        fixture.detectChanges();
        expect(component.updatePost).toHaveBeenCalledWith(postsMock.getOnePostWithId(2));
      });

    });
  });

  describe('Get Post Selected', () => {
    beforeEach(() => {
      postsMock = new PostsMock();
    });

    describe('Post is not present case', () => {
      beforeEach(() => {
        postServiceMock.getSelectedPost.and.returnValue(of(null));
      });

      it('should call setCountDown when post is not present', done => {
        spyOn(component, 'setCountDown');
        fixture.detectChanges();
        postServiceMock.getSelectedPost().subscribe(() => {
          expect(component.setCountDown).toHaveBeenCalled();
          done();
        });
      });

      it('should call navigateToHomeAfterTimeOut with value when post is not present', done => {
        spyOn(component, 'navigateToHomeAfterTimeOut');
        component.coundown = 5;
        fixture.detectChanges();
        postServiceMock.getSelectedPost().subscribe(() => {
          expect(component.navigateToHomeAfterTimeOut).toHaveBeenCalledWith(component.coundown * 1000);
          done();
        });
      });

    });

    describe('Post is present case', () => {
      beforeEach(() => {
        postServiceMock.getSelectedPost.and.returnValue(of(postsMock.getOnePostWithId(1)));
        component.getPost();
      });

      it('should get one post from service', () => {
        postServiceMock.getSelectedPost().subscribe(post => {
          expect(post).toEqual(postsMock.getOnePostWithId(1));
        });
      });

      it('should not call setCountDown when post is present', done => {
        spyOn(component, 'setCountDown');
        postServiceMock.getSelectedPost().subscribe(() => {
          expect(component.setCountDown).not.toHaveBeenCalled();
          done();
        });
      });

      it('should not call navigateToHomeAfterTimeOut when post is present', done => {
        spyOn(component, 'navigateToHomeAfterTimeOut');
        postServiceMock.getSelectedPost().subscribe(() => {
          expect(component.navigateToHomeAfterTimeOut).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('should set countdown', () => {
    beforeEach(() => {
      jasmine.clock().install();
      component.setCountDown();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should countdown to 0 after 5s when  setCountdown method is called', () => {
      component.coundown = 5;
      jasmine.clock().tick(5000);
      /*expect countdown value to be close 0 with precision of 0.001 means -0.0001 < countdonw < 0.0001*/
      expect(component.coundown).toBeCloseTo(0, 0.001);
    });

    it('should countdown to 2 after 3s when  setCountdown method is called', () => {
      component.coundown = 5;
      jasmine.clock().tick(3000);
      /*expect countdown value to be close 0 with precision of 0.001 means -0.0001 < countdonw < 0.0001*/
      expect(component.coundown).toBeCloseTo(2, 0.001);
    });

  });

  describe('should navigate to root path after time out', () => {
    const timeOut = 5000;
    beforeEach(() => {
      jasmine.clock().install();
      component.navigateToHomeAfterTimeOut(timeOut);
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should not navigate when time not reached', () => {
      spyOn(router, 'navigateByUrl');
      jasmine.clock().tick(2000);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should navigate when time is reached', () => {
      spyOn(router, 'navigateByUrl');
      jasmine.clock().tick(timeOut + 1);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

  });

  describe('should update post', () => {
    beforeEach(() => {
      postsMock = new PostsMock();
      postServiceMock.updatePost.and.returnValue(of([]));
    });

    it('should call updatePost from postsService', () => {
      component.updatePost(postsMock.getOnePostWithId(1));
      expect(postServiceMock.updatePost).toHaveBeenCalledWith(postsMock.getOnePostWithId(1));
    });

    it('should alert successfully when getting response postsService', done => {
      spyOn(window, 'alert');
      component.updatePost(postsMock.getOnePostWithId(1));
      postServiceMock.updatePost(postsMock.getOnePostWithId(1)).subscribe(res => {
        expect(window.alert).toHaveBeenCalledWith('Successfully edited');
        done();
      });
    });

    it('should alert fail when getting error from postsService', done => {
      postServiceMock.updatePost.and.returnValue(throwError('error'));
      spyOn(window, 'alert');
      component.updatePost(postsMock.getOnePostWithId(1));
      postServiceMock.updatePost(postsMock.getOnePostWithId(1)).subscribe(() => {
      }, () => {
        expect(window.alert).toHaveBeenCalledWith('Edit Error');
        done();
      });
    });
  });

  // describe('TDD Comment Dsiplay', () => {
  //   beforeEach(() => {
  //     htmlUtil = new IntructionsHelper(fixture);
  //     postsMock = new PostsMock();
  //   });
  //
  //   describe('HTML DOM Tests', () => {
  //     beforeEach(() => {
  //       component.post = postsMock.getOnePostWithId(1);
  //       postServiceMock.getCommentsOfPostId.and.returnValue(of(postsMock.getCommentsOfPostId(component.post.id)));
  //     });
  //
  //     it('should show --Display comments-- button', () => {
  //       fixture.detectChanges();
  //       expect(htmlUtil.singleText('button.show-comments')).toEqual('Display Comments');
  //     });
  //
  //     it('should not show commments if button not clicked', () => {
  //       fixture.detectChanges();
  //       expect(htmlUtil.count('.comments')).toEqual(1);
  //       expect(htmlUtil.count('.comment')).toEqual(0);
  //     });
  //
  //     it('should show same comments of selected post ', () => {
  //       component.comments = postsMock.getCommentsOfPostId(component.post.id);
  //       fixture.detectChanges();
  //       expect(htmlUtil.count('.comment')).toEqual(component.comments.length);
  //     });
  //
  //     it('should show comments body of selected Post', () => {
  //       component.comments = postsMock.getCommentsOfPostId(component.post.id);
  //       fixture.detectChanges();
  //       let elemContent = '';
  //       htmlUtil.findAll('.comment').forEach((elem, i) => {
  //         elemContent = elem.nativeElement.textContent;
  //         expect(elemContent).toEqual(component.comments[i].body);
  //       });
  //     });
  //   });
  //
  //   describe('Get Comment Of selected Post', () => {
  //     beforeEach(() => {
  //       postsMock = new PostsMock();
  //       htmlUtil = new IntructionsHelper(fixture);
  //       component.post = postsMock.getOnePostWithId(1);
  //       postServiceMock.getCommentsOfPostId.and.returnValue(of(postsMock.getCommentsOfPostId(component.post.id)));
  //     });
  //     it('should call getComments when clicking button', () => {
  //       spyOn(component, 'getComments');
  //       fixture.detectChanges();
  //       htmlUtil.clickEvent('button.show-comments');
  //       expect(component.getComments).toHaveBeenCalledWith(component.post.id);
  //     });
  //
  //     it('should call getCommentsOfPostId with post id', () => {
  //       component.getComments(component.post.id);
  //       expect(postServiceMock.getCommentsOfPostId).toHaveBeenCalledWith(component.post.id);
  //     });
  //
  //     it('should call getCommentsOfPostId with post id', done => {
  //       component.getComments(component.post.id);
  //       postServiceMock.getCommentsOfPostId(component.post.id).subscribe(comments => {
  //         expect(component.comments).toEqual(comments);
  //         done();
  //       });
  //     });
  //
  //     it('should alert with error if  getCommentsOfPostId with post id return error', done => {
  //       postServiceMock.getCommentsOfPostId.and.returnValue(throwError('error'));
  //       spyOn(window, 'alert');
  //       component.getComments(component.post.id);
  //       postServiceMock.getCommentsOfPostId(component.post.id).subscribe(() => {
  //       }, () => {
  //         expect(window.alert).toHaveBeenCalledWith('Error fetching comment');
  //         done();
  //       });
  //     });
  //   });
  // });
});

@Component({
  template: '<span></span>'
})
class MockComponent {
}
