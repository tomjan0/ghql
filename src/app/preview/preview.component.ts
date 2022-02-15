import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';

const repositoryQuery = gql`
  query ($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      name
      description
      stargazerCount
      owner {
        login
        avatarUrl
      }
      watchers {
        totalCount
      }
      primaryLanguage {
        name
      }
      forkCount
      defaultBranchRef {
        name
      }
      homepageUrl
    }
  }
`;

interface RepositoryQueryParams {
  name: string;
  owner: string;
}

interface Repository {
  name: string;
  description: string;
  stargazerCount: number;
  owner: {
    login: string;
    avatarUrl: string;
  };
  watchers: {
    totalCount: number;
  };
  primaryLanguage: {
    name: string;
  };
  forkCount: number;
  defaultBranchRef: {
    name: string;
  };
  homepageUrl: string;
}

interface RepositoryQueryResults {
  repository: Repository;
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewComponent implements OnInit {
  loading = false;
  repository?: Repository;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private apollo: Apollo,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const { name, owner } = this.route.snapshot.params;

    this.apollo
      .query<RepositoryQueryResults, RepositoryQueryParams>({
        query: repositoryQuery,
        variables: {
          name,
          owner,
        },
      })
      .toPromise()
      .then(({ data }) => {
        this.repository = data.repository;
      })
      .catch((err) => {
        console.error(err);
        this.error =
          err?.message || 'Something went wrong. Try refreshing the page.';
      })
      .finally(() => {
        this.ref.markForCheck();
      });
  }
}
