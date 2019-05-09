import React from 'react';
import Parser from './Parser';
import Markup, { MarkupProps } from './Markup';
import { FilterInterface } from './Filter';
import { MatcherInterface } from './Matcher';
import { AfterParseCallback, BeforeParseCallback } from './types';

export interface InterweaveProps extends MarkupProps {
  [prop: string]: any;
  /** Disable all filters from running. */
  disableFilters?: boolean;
  /** Disable all matches from running. */
  disableMatchers?: boolean;
  /** List of filters to apply to the content. */
  filters?: FilterInterface[];
  /** List of matchers to apply to the content. */
  matchers?: MatcherInterface<any>[];
  /** Callback fired after parsing ends. Must return an array of React nodes. */
  onAfterParse?: AfterParseCallback<InterweaveProps> | null;
  /** Callback fired beore parsing begins. Must return a string. */
  onBeforeParse?: BeforeParseCallback<InterweaveProps> | null;
}

export interface AllMatcherProps {
  /** Support all the props used by matchers. */
  [prop: string]: any;
}

export default class Interweave extends React.PureComponent<InterweaveProps & AllMatcherProps> {
  static defaultProps: InterweaveProps = {
    content: '',
    disableFilters: false,
    disableMatchers: false,
    emptyContent: null,
    filters: [],
    matchers: [],
    onAfterParse: null,
    onBeforeParse: null,
    tagName: 'span',
  };

  /**
   * Parse the markup and apply hooks.
   */
  parseMarkup(): React.ReactNode {
    const {
      content,
      disableFilters,
      disableMatchers,
      emptyContent,
      filters,
      matchers,
      onAfterParse,
      onBeforeParse,
      tagName,
      ...props
    } = this.props as Required<InterweaveProps>;

    const allMatchers = disableMatchers ? [] : matchers;
    const allFilters = disableFilters ? [] : filters;
    const beforeCallbacks = onBeforeParse ? [onBeforeParse] : [];
    const afterCallbacks = onAfterParse ? [onAfterParse] : [];

    // Inherit callbacks from matchers
    allMatchers.forEach(matcher => {
      if (matcher.onBeforeParse) {
        beforeCallbacks.push(matcher.onBeforeParse.bind(matcher));
      }

      if (matcher.onAfterParse) {
        afterCallbacks.push(matcher.onAfterParse.bind(matcher));
      }
    });

    // Trigger before callbacks
    const markup = beforeCallbacks.reduce((string, callback) => {
      const nextString = callback(string, this.props);

      if (__DEV__) {
        if (typeof nextString !== 'string') {
          throw new TypeError('Interweave `onBeforeParse` must return a valid HTML string.');
        }
      }

      return nextString;
    }, content || '');

    // Parse the markup
    const parser = new Parser(markup, props, allMatchers, allFilters);

    // Trigger after callbacks
    const nodes = afterCallbacks.reduce((parserNodes, callback) => {
      const nextNodes = callback(parserNodes, this.props);

      if (__DEV__) {
        if (!Array.isArray(nextNodes)) {
          throw new TypeError(
            'Interweave `onAfterParse` must return an array of strings and React elements.',
          );
        }
      }

      return nextNodes;
    }, parser.parse());

    if (nodes.length === 0) {
      return emptyContent;
    }

    return nodes;
  }

  /**
   * Render the component by parsing the markup.
   */
  render() {
    const { emptyContent, tagName } = this.props;

    return (
      <Markup emptyContent={emptyContent} tagName={tagName} parsedContent={this.parseMarkup()} />
    );
  }
}
