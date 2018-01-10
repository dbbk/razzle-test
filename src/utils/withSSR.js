import React from 'react';
import PropTypes from 'prop-types';

// This is a Higher Order Component that abstracts duplicated data fetching
// on the server and client.
export default function SSR(Page) {
  class SSR extends React.Component {
    static getInitialData(ctx) {
      // Need to call the wrapped components getInitialData if it exists
      return Page.getInitialData
        ? Page.getInitialData(ctx)
        : Promise.resolve(null);
    }

    static contextTypes = {
      shoebox: PropTypes.any
    };

    constructor(props, context) {
      super(props);

      console.log('Constructor props', props);
      console.log('Constructor context', context);

      const shoeboxId = `${getDisplayName(Page)}`;
      console.log('Constructor Page', Page);
      console.log('Constructor shoebox id', shoeboxId);

      let shoeboxData;
      if (context && context.shoebox && context.shoebox.data) {
        shoeboxData = context.shoebox.data[shoeboxId];
      } else if (
        typeof window !== 'undefined' &&
        window._SHOEBOX_DATA &&
        window._SHOEBOX_DATA[shoeboxId]
      ) {
        shoeboxData = window._SHOEBOX_DATA[shoeboxId];
        console.log('Constructor window shoebox', shoeboxData);
      }

      this.state = {
        shoeboxId,
        data: shoeboxData,
        isLoading: false
      };

      this.ignoreLastFetch = false;
    }

    componentDidMount() {
      if (!this.state.data) {
        this.fetchData();
      }
    }

    componentWillUnmount() {
      this.ignoreLastFetch = true;
    }

    fetchData = async () => {
      // if this.state.data is null, that means that the we are on the client.
      // To get the data we need, we just call getInitialData again on mount.
      if (!this.ignoreLastFetch) {
        console.log('refetching');
        this.setState({ isLoading: true });
        return this.constructor
          .getInitialData({ match: this.props.match })
          .then(
            data => {
              this.setState({ data, isLoading: false });
              console.log('Got data!', data);
              return data;
            },
            error => {
              this.setState(state => ({
                data: { error },
                isLoading: false
              }));
              return { error };
            }
          );
      }
    };

    render() {
      // Flatten out all the props.
      const { initialData, ...rest } = this.props;

      //  if we wanted to create an app-wide error component,
      //  we could also do that here using <HTTPStatus />. However, it is
      //  more flexible to leave this up to the Routes themselves.
      //
      // if (rest.error && rest.error.code) {
      //   <HttpStatus statusCode={rest.error.code || 500}>
      //     {/* cool error screen based on status code */}
      //   </HttpStatus>
      // }

      console.log('SSR initial data...', this.state.data);

      return (
        <Page
          {...rest}
          shoeboxId={this.state.shoeboxId}
          refetch={this.fetchData}
          isLoading={this.state.isLoading}
          data={this.state.data}
        />
      );
    }
  }

  SSR.displayName = `SSR(${getDisplayName(Page)})`;
  return SSR;
}

// This make debugging easier. Components will show as SSR(MyComponent) in
// react-dev-tools.
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}