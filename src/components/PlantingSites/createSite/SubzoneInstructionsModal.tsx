import strings from 'src/strings';
import VideoDialog from 'src/components/common/VideoDialog';
import { useDocLinks } from 'src/docLinks';

export type SubzoneInstructionsModalProps = {
  force?: boolean;
  onClose: (dontShowAgain?: boolean) => void;
  open: boolean;
};

export default function SubzoneInstructionsModal(props: SubzoneInstructionsModalProps): JSX.Element {
  const { force, onClose, open } = props;
  const docLinks = useDocLinks();

  return (
    <VideoDialog
      description={strings.ADDING_SUBZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION}
      link={docLinks.planting_site_create_subzone_boundary_instructions_video}
      onClose={() => onClose()}
      onDontShowAgain={force ? undefined : () => onClose(true)}
      open={open}
      title={strings.ADDING_SUBZONE_BOUNDARIES}
    />
  );
}
