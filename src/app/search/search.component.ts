import { Component } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';

interface SearchQueryParams {
  search: string;
  after: string | null;
  limit: number;
}

interface SearchQueryResults {
  search: {
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
    repositoryCount: number;
    edges: {
      cursor: string;
      node: {
        name: string;
        description: string;
        stargazerCount: number;
        owner: {
          login: string;
        };
      };
    }[];
  };
}

const searchQuery = gql`
  query Search($search: String!, $limit: Int, $after: String) {
    search(query: $search, type: REPOSITORY, first: $limit, after: $after) {
      repositoryCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ... on Repository {
            name
            owner {
              login
            }
            stargazerCount
            description
          }
        }
      }
    }
  }
`;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  results: SearchQueryResults | null = null;
  search = '';
  loading = false;
  searchQuery?: QueryRef<SearchQueryResults, SearchQueryParams>;
  subscription?: Subscription;
  itemsPerPage = 10;

  constructor(private apollo: Apollo) {}

  fetch() {
    if (!this.loading) {
      this.subscription?.unsubscribe();

      this.searchQuery = this.apollo.watchQuery<
        SearchQueryResults,
        SearchQueryParams
      >({
        query: searchQuery,
        variables: {
          search: this.search,
          after: null,
          limit: this.itemsPerPage,
        },
        fetchPolicy: 'network-only',
      });

      this.loading = true;
      this.subscription = this.searchQuery.valueChanges.subscribe(
        ({ data }) => {
          this.results = data;
          this.loading = false;
        }
      );
    }
  }

  fetchMore() {
    if (!this.loading) {
      this.loading = true;
      this.searchQuery?.fetchMore({
        variables: { after: this.results?.search.pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return {
            search: {
              ...fetchMoreResult.search,
              edges: [...prev.search.edges, ...fetchMoreResult.search.edges],
            },
          };
        },
      });
    }
  }
}
