import { BusySpinner } from '@terraware/web-components';
import PageForm, { PageFormProps as FormProps } from '@terraware/web-components/components/PageForm';
import strings from 'src/strings';

export type PageFormProps = Omit<FormProps, 'saveButtonText' | 'cancelButtonText'> & {
  busy?: boolean;
  cancelButtonText?: string;
  saveButtonText?: string;
};

export default function WrappedPageForm(props: PageFormProps): JSX.Element {
  const { busy, cancelButtonText, saveButtonText, ...formProps } = props;

  return (
    <>
      {busy && <BusySpinner withSkrim={true} />}
      <PageForm
        {...formProps}
        saveButtonText={saveButtonText || strings.SAVE}
        cancelButtonText={cancelButtonText || strings.CANCEL}
      />
    </>
  );
}
