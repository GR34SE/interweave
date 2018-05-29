/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import React from 'react';
import PropTypes from 'prop-types';
import EmojiCharacter, {
  CanonicalEmoji,
  EmojiShape,
  EmojiPath,
  EmojiPathShape,
  EmojiSource,
  EmojiSourceShape,
} from 'interweave-emoji';
import withContext, { ContextShape, EmojiContext } from './Context';

export interface EmojiProps {
  active: boolean;
  context: EmojiContext;
  emoji: CanonicalEmoji;
  emojiPadding: number;
  emojiPath: EmojiPath;
  emojiSize: number;
  emojiSource: EmojiSource;
  onEnter: (emoji: CanonicalEmoji, event: React.MouseEvent<HTMLButtonElement>) => void;
  onLeave: (emoji: CanonicalEmoji, event: React.MouseEvent<HTMLButtonElement>) => void;
  onSelect: (emoji: CanonicalEmoji, event: React.MouseEvent<HTMLButtonElement>) => void;
  showImage: boolean;
}

export interface EmojiState {
  active: boolean;
}

export class EmojiButton extends React.PureComponent<EmojiProps, EmojiState> {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    context: ContextShape.isRequired,
    emoji: EmojiShape.isRequired,
    emojiPadding: PropTypes.number.isRequired,
    emojiPath: EmojiPathShape.isRequired,
    emojiSize: PropTypes.number.isRequired,
    emojiSource: EmojiSourceShape.isRequired,
    onEnter: PropTypes.func.isRequired,
    onLeave: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    showImage: PropTypes.bool.isRequired,
  };

  state = {
    active: this.props.active,
  };

  componentDidUpdate(prevProps: EmojiProps) {
    if (this.props.active !== prevProps.active) {
      this.setState({
        active: this.props.active,
      });
    }
  }

  /**
   * Triggered when the emoji is clicked.
   */
  private handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    this.props.onSelect(this.props.emoji, event);
  };

  /**
   * Triggered when the emoji is hovered.
   */
  private handleEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    this.setState({
      active: true,
    });

    this.props.onEnter(this.props.emoji, event);
  };

  /**
   * Triggered when the emoji is no longer hovered.
   */
  private handleLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    this.setState({
      active: false,
    });

    this.props.onLeave(this.props.emoji, event);
  };

  render() {
    const { emoji, emojiPadding, emojiPath, emojiSize, emojiSource, showImage } = this.props;
    const { classNames } = this.props.context;
    const { active } = this.state;
    const dimension = emojiPadding + emojiPadding + emojiSize;
    const className = [classNames.emoji];

    if (active) {
      className.push(classNames.emojiActive);
    }

    return (
      <button
        aria-label={emoji.annotation}
        key={emoji.hexcode}
        className={className.join(' ')}
        style={{
          height: dimension,
          padding: emojiPadding,
          width: dimension,
        }}
        type="button"
        onClick={this.handleClick}
        onMouseEnter={this.handleEnter}
        onMouseLeave={this.handleLeave}
      >
        {showImage ? (
          <EmojiCharacter
            emojiPath={emojiPath}
            emojiSize={emojiSize}
            emojiSource={emojiSource}
            hexcode={emoji.hexcode}
          />
        ) : (
          <div
            style={{
              height: emojiSize,
              overflow: 'hidden',
              visibility: 'hidden',
              width: emojiSize,
            }}
          >
            &nbsp;
          </div>
        )}
      </button>
    );
  }
}

export default withContext(EmojiButton);
