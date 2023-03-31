import PageForm, { PageFormProps as FormProps } from '@terraware/web-components/components/PageForm';
import strings from 'src/strings';

export type PageFormProps = Omit<FormProps, 'saveButtonText' | 'cancelButtonText'> & {
  cancelButtonText?: string;
  saveButtonText?: string;
};

export default function WrappedPageForm(props: PageFormProps): JSX.Element {
  const { cancelButtonText, saveButtonText, ...formProps } = props;

  return PageForm({
    ...formProps,
    saveButtonText: saveButtonText || strings.SAVE,
    cancelButtonText: saveButtonText || strings.CANCEL,
  });
}
