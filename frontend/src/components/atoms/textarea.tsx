import styled from 'styled-components'

type Props = {
  className?: string
  name?: string
  value: string
  placeholder?: string
  maxLength?: number
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const StyledTextarea = styled.textarea`
  width: 100%;
  height: auto;
  min-height: 15rem;
  padding: 1.1rem 1.3rem;
  font-size: 1.4rem;
  line-height: 1.5;
  border-radius: 0.5rem;
  border: 0.1rem solid ${(props): string => props.theme.borderGray};
  transition: all 0.2s cubic-bezier(0.45, 0, 0.55, 1);

  &:focus {
    outline: 0;
    border: 0.15rem solid ${(props): string => props.theme.primary};
  }
`

export const Textarea: React.FC<Props> = ({ className = '', name, value, placeholder, maxLength, onChange }) => {
  return (
    <StyledTextarea className={className} name={name} value={value} placeholder={placeholder} maxLength={maxLength} onChange={onChange} />
  )
}
