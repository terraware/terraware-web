import ExportCsvModal from 'src/components/common/ExportCsvModal';
import { ParticipantsService } from 'src/services';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

interface DownloadParticipantsProps {
  onClose: () => void;
  open: boolean;
  search?: SearchNodePayload;
  sort?: SearchSortOrder;
}

export default function DownloadParticipants(props: DownloadParticipantsProps): JSX.Element {
  const { onClose, open, search, sort } = props;

  const onExport = async () => {
    return await ParticipantsService.download(search, sort);
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
