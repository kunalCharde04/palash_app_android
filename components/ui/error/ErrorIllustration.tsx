import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@/theme/theme-provider';

export const ErrorIllustration = () => {
    const theme = useTheme();
    
    return (
      <Svg width="160" height="160" viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke={theme.colors.feedback.error.main}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 8V12"
          stroke={theme.colors.feedback.error.main}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 16H12.01"
          stroke={theme.colors.feedback.error.main}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };