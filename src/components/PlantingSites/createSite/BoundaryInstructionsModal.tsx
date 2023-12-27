import strings from 'src/strings';
import VideoDialog from 'src/components/common/VideoDialog';
import { useDocLinks } from 'src/docLinks';

export type BoundaryInstructionsModalProps = {
  onClose: (dontShowAgain?: boolean) => void;
  open: boolean;
};

export default function BoundaryInstructionsModal(props: BoundaryInstructionsModalProps): JSX.Element {
  const { onClose, open } = props;
  const docLinks = useDocLinks();

  return (
    <VideoDialog
      description={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION}
      link={docLinks.planting_site_create_boundary_instructions_video}
      onClose={onClose}
      open={open}
      title={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
    />
  );
}
