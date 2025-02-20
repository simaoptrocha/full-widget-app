import { ReactNode, useState, useMemo } from 'react';
import Image from 'next/image';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Fade from '@mui/material/Fade';

import { jakarta } from '@/src/utils';
import { TextInput } from '@/components/common/TextInput';
import close from '@/public/icons/close.svg';
import caret from '@/public/icons/caret.svg';
import styles from './select.module.css';

type ListElement = {
  id: string;
  searchText: string;
  content: ReactNode;
  name: string;
};

type SelectProps = {
  title: string;
  label: string;
  list: ListElement[];
  setSelected: Function;
  selected?: string;
  placeholder?: string;
  error?: string;
  tooltip?: string;
};

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#fff',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 240,
    fontSize: theme.typography.pxToRem(12),
    border: '0px',
    borderRadius: 8,
    boxShadow: '-1px 1px 4px 0px rgba(0, 0, 0, 0.25)',
    marginRight: -2,
  },
}));

export const Select = ({
  title,
  list,
  label,
  placeholder,
  setSelected,
  selected,
  error,
  tooltip,
}: SelectProps) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [openTooltip, setOpenTooltip] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setSearch('');
    setShowModal(false);
  };

  const handleSelected = (id: string) => {
    setSelected(id);
    closeModal();
  };

  const filteredList = useMemo(
    () =>
      list.filter(({ searchText }) =>
        !searchText ? true : searchText.includes(search.toLowerCase()),
      ),
    [search, list],
  );
  const selectedItem = list.find(({ id }) => id === selected)?.name;

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <div className={styles.labelText}>{label}</div>
        {tooltip && (
          <HtmlTooltip
            placement={'bottom-end'}
            open={openTooltip}
            onClose={() => setOpenTooltip(false)}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 1000 }}
            title={
              <div className={[styles.tooltipText, jakarta.className].join(' ')}>{tooltip}</div>
            }>
            <div onClick={() => setOpenTooltip(true)} className={styles.infoIcon}></div>
          </HtmlTooltip>
        )}
      </div>
      <div
        className={[styles.selectedInput, selectedItem ? '' : styles.placeholder].join(' ')}
        onClick={openModal}>
        {selectedItem ?? placeholder ?? ''}
      </div>
      <div className={styles.error}>{error}</div>
      {showModal && (
        <div className={styles.modalContainer}>
          <div className={styles.top}>
            <div className={styles.titleContainer}>
              <div className={styles.title}>{title}</div>
              <div className={styles.close} onClick={closeModal}>
                <Image src={close} width={15} height={15} alt="Close button" />
              </div>
            </div>
            <TextInput
              autoFocus={true}
              value={search}
              label=""
              onChange={(ev: any) => setSearch(ev.target.value)}
              placeholder="Search"
            />
          </div>
          <div className={styles.listContainer}>
            <div className={styles.list}>
              {filteredList.map(({ id, content }) => {
                return (
                  <div key={id} className={styles.listItem} onClick={() => handleSelected(id)}>
                    {content}
                    <div className={styles.caret}>
                      <Image src={caret} width={10} height={10} alt="go" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
