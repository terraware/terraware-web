import ExportCsvModal from 'src/components/common/ExportCsvModal';
import ParticipantProjectService from 'src/services/ParticipantProjectService';

interface ExportProps {
  onClose: () => void;
  open: boolean;
  projectId: number;
}

export default function Export(props: ExportProps): JSX.Element {
  const { projectId, onClose, open } = props;

  const onExport = () => ParticipantProjectService.download(projectId);

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
