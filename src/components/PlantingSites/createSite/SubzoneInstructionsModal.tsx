import strings from 'src/strings';
import VideoDialog from 'src/components/common/VideoDialog';
import { useDocLinks } from 'src/docLinks';

export type SubzoneInstructionsModalProps = {
  onClose: (dontShowAgain?: boolean) => void;
  open: boolean;
};

export default function SubzoneInstructionsModal(props: SubzoneInstructionsModalProps): JSX.Element {
  const { onClose, open } = props;
  const docLinks = useDocLinks();

  return (
    <VideoDialog
      description={strings.ADDING_SUBZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION}
      link={docLinks.planting_site_create_subzone_boundary_instructions_video}
      onClose={onClose}
      open={open}
      title={strings.ADDING_SUBZONE_BOUNDARIES}
    />
  );
}
